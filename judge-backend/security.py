import ast
import builtins
from typing import Tuple, Optional

WARNING_MESSAGE = "Security Violation: restricted operation or module detected"

FORBIDDEN_MODULES = {
    'socket', 'http', 'urllib', 'requests', 'ftplib', 'telnetlib', 'smtplib',
    'asyncio', 'multiprocessing', 'os', 'subprocess', 'shutil', 'tempfile',
    'inspect', 'pdb', 'posix', 'pwd', 'pty', 'platform', 'ctypes', 'importlib'
}

DANGEROUS_ATTRIBUTES = {
    '__subclasses__', '__bases__', '__base__', '__globals__',
    '__code__', '__closure__', '__builtins__', '__import__',
    '__dict__', '__class__'
}

DANGEROUS_BUILTINS = {
    'open', 'eval', 'exec', 'compile', 'getattr', 'setattr',
    'delattr', 'help', 'breakpoint'
}

class SecurityNodeVisitor(ast.NodeVisitor):
    def __init__(self):
        self.is_valid = True
        self.error_message = None

    def _violation(self, msg: str, node: ast.AST):
        lineno = getattr(node, 'lineno', '?')
        self.is_valid = False
        self.error_message = f"{msg} (line {lineno})"

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            root_module = alias.name.split('.')[0]
            if root_module in FORBIDDEN_MODULES:
                self._violation(f"Import of '{root_module}' is strictly forbidden", node)
                return
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            root_module = node.module.split('.')[0]
            if root_module in FORBIDDEN_MODULES:
                self._violation(f"Import from '{root_module}' is strictly forbidden", node)
                return
            if root_module == 'sys':
                for alias in node.names:
                    if alias.name in ('modules', '_getframe', 'exit'):
                        self._violation(f"Importing 'sys.{alias.name}' is strictly forbidden", node)
                        return
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute):
        if node.attr in DANGEROUS_ATTRIBUTES:
            self._violation(f"Access to restricted attribute '{node.attr}' is blocked", node)
            return
        # Block sys.modules access
        if isinstance(node.value, ast.Name) and node.value.id == 'sys' and node.attr in ('modules', '_getframe', 'exit'):
            self._violation(f"Access to 'sys.{node.attr}' is strictly forbidden", node)
            return
        self.generic_visit(node)

    def visit_Name(self, node: ast.Name):
        if (node.id in DANGEROUS_BUILTINS or node.id == '__import__') and isinstance(node.ctx, ast.Load):
            self._violation(f"Use of restricted built-in '{node.id}' is blocked", node)
            return
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name) and (node.func.id in DANGEROUS_BUILTINS or node.func.id == '__import__'):
            self._violation(f"Call to restricted built-in '{node.func.id}' is blocked", node)
            return
        self.generic_visit(node)

def validate_code(code: str) -> Tuple[bool, Optional[str]]:
    """
    Performs AST-based static analysis to detect forbidden modules,
    dangerous built-ins, and introspection-based sandbox escapes.
    Returns (True, None) if valid, (False, error_message) otherwise.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        # Let compiler handle syntax error reporting with full line info
        return True, None

    visitor = SecurityNodeVisitor()
    visitor.visit(tree)
    if not visitor.is_valid:
        return False, visitor.error_message
    return True, None

original_import = builtins.__import__

def restricted_import(name, globals=None, locals=None, fromlist=(), level=0):
    root = name.split('.')[0]
    if root in FORBIDDEN_MODULES:
        raise ImportError(f"Import of '{name}' is forbidden")
    return original_import(name, globals, locals, fromlist, level)

def get_safe_globals():
    """
    Returns a dictionary of globals that includes a restricted __import__
    and removes dangerous built-ins.
    """
    safe_builtins = builtins.__dict__.copy()
    safe_builtins['__import__'] = restricted_import

    for b in DANGEROUS_BUILTINS:
        if b in safe_builtins:
            del safe_builtins[b]

    return {"__builtins__": safe_builtins}
