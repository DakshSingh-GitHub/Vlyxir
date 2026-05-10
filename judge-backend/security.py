import re
import builtins
import ast

WARNING_MESSAGE = "no pinging to any external servers"

# List of modules that are strictly forbidden (related to networking/system access)
FORBIDDEN_MODULES = {
    'socket', 'http', 'urllib', 'requests', 'ftplib', 'telnetlib', 'smtplib', 
    'asyncio', 'multiprocessing', 'os', 'subprocess', 'shutil', 'tempfile',
    'sys', 'inspect', 'pdb', 'posix', 'pwd', 'threading', '_thread'
}

# Regex to catch obvious imports and system calls (as a fast first pass)
RESTRICTED_KEYWORDS = [
    r'import\s+(socket|http|urllib|requests|ftplib|telnetlib|smtplib|asyncio|os|subprocess|sys|inspect|pdb|posix|pwd|threading)',
    r'from\s+(socket|http|urllib|requests|ftplib|telnetlib|smtplib|asyncio|os|subprocess|sys|inspect|pdb|posix|pwd|threading)',
    r'__import__',
    r'getattr',
    r'setattr',
    r'delattr',
    r'exec\s*\(',
    r'eval\s*\(',
    r'open\s*\(',
    r'os\.(system|popen|spawn|exec|posix_spawn)',
    r'subprocess\.(run|Popen|call|check_call|check_output)'
]

class SecurityTransformer(ast.NodeVisitor):
    def __init__(self):
        self.is_safe = True
        self.error_message = None

    def visit_Import(self, node):
        for alias in node.names:
            if alias.name.split('.')[0] in FORBIDDEN_MODULES:
                self.is_safe = False
                self.error_message = f"Forbidden module import: {alias.name}"
                return
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module and node.module.split('.')[0] in FORBIDDEN_MODULES:
            self.is_safe = False
            self.error_message = f"Forbidden module import: {node.module}"
            return
        self.generic_visit(node)

    def visit_Call(self, node):
        # Check for direct calls to forbidden functions
        func_name = None
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr

        if func_name in ['eval', 'exec', 'open', '__import__', 'getattr', 'setattr', 'delattr', 'compile', 'breakpoint']:
            self.is_safe = False
            self.error_message = f"Forbidden function call: {func_name}"
            return

        self.generic_visit(node)

    def visit_Attribute(self, node):
        # Block access to sensitive attributes like __globals__, __subclasses__, etc.
        if node.attr.startswith('__') and node.attr != '__init__':
            self.is_safe = False
            self.error_message = f"Access to sensitive attribute: {node.attr}"
            return
        self.generic_visit(node)

def validate_code(code: str) -> (bool, str):
    """
    Performs static analysis on the code to detect restricted keywords and patterns.
    Returns (True, None) if valid, (False, warning_message) otherwise.
    """
    # 1. Fast Regex Pass
    for pattern in RESTRICTED_KEYWORDS:
        if re.search(pattern, code, re.IGNORECASE):
            return False, WARNING_MESSAGE

    # 2. AST Analysis Pass
    try:
        tree = ast.parse(code)
        visitor = SecurityTransformer()
        visitor.visit(tree)
        if not visitor.is_safe:
            return False, f"Security Violation: {visitor.error_message}"
    except SyntaxError:
        # We let the actual compilation/execution handle syntax errors
        pass
    except Exception as e:
        # If AST parsing fails for other reasons, we might want to block or log
        # For security, blocking is safer, but let's just log and allow for now
        # unless it's a clear failure.
        pass

    return True, None

def restricted_import(name, globals=None, locals=None, fromlist=(), level=0):
    """
    A custom __import__ function that blocks forbidden modules.
    """
    if name.split('.')[0] in FORBIDDEN_MODULES:
        raise ImportError(WARNING_MESSAGE)
    
    return original_import(name, globals, locals, fromlist, level)

# Store the original __import__ to use inside our restricted version
original_import = builtins.__import__

def get_safe_globals():
    """
    Returns a dictionary of globals that includes a restricted __import__
    and removes dangerous built-ins.
    """
    safe_builtins = builtins.__dict__.copy()
    safe_builtins['__import__'] = restricted_import

    # Remove dangerous built-ins
    dangerous_builtins = [
        'open', 'eval', 'exec', 'compile', 'getattr', 'setattr',
        'delattr', 'help', 'input', 'breakpoint'
    ]
    for b in dangerous_builtins:
        if b in safe_builtins:
            del safe_builtins[b]

    return {"__builtins__": safe_builtins}
