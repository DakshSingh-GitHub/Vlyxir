# User Profile Page Design and Implementation

Design and implement a premium, dynamic user profile page for VLYXIR at the route `app/(web)/user/[user-id]/page.tsx`.

## User Review Required

> [!IMPORTANT]
> The profile page will be public. It will display the user's full name, username, bio, country, and problem-solving statistics.
> We need to ensure that the `submissions` and `profiles` tables in Supabase have appropriate Read policies (RLS) for public access if this page is intended for non-logged-in users to view as well.

> [!NOTE]
> I will implement a "Premium" aesthetic using gradients, glassmorphism, and smooth animations consistent with the VLYXIR rebranding.

## Proposed Changes

### [judge-frontend]

#### [NEW] [page.tsx](file:///c:/Users/daksh/Documents/GitHub/code-judge/judge-frontend/app/(web)/user/[user-id]/page.tsx)
Implement the main profile page component.
- **Data Fetching**:
    - Use `supabase` client to fetch profile data from the `profiles` table using the `user-id`.
    - Fetch submission history from the `submissions` table to calculate stats (total solved, accuracy, etc.).
- **UI Components**:
    - **Header**: Banner background, high-quality avatar placeholder/initials, display name, username, and "Member since" date using `formatAccountDate`.
    - **Stats Grid**: Bento-style grid showing:
        - Problems Solved (Total and by difficulty).
        - Success Rate (Accepted vs Total).
        - Current Level/Rank (Derived from solved count).
        - Coding Streak (Mocked or calculated if timestamp data is sufficient).
    - **Tabs/Sections**:
        - **Overview**: Recent activity and top skills.
        - **Submissions**: A paginated or scrollable list of recent submissions with status and problem links.
- **Animations**:
    - Use `framer-motion` for staggered entrance animations and hover effects on stats cards.
- **Responsive Design**: Ensure the layout adapts gracefully from mobile to desktop.

## Open Questions

1. **Public vs Private**: Should this page be accessible to everyone (public) or only logged-in users? (Assuming public for a "profile" page).
2. **Ranking System**: Do you have a specific formula for "Level" or "Rank"? If not, I'll design a sensible default based on the number of problems solved.
3. **Avatar**: The `profiles` table doesn't seem to have an `avatar_url` column in the helper. Should I add support for avatars or use generated initials for now?

## Verification Plan

### Automated Tests
- I will use the browser subagent to verify the page renders correctly for a given user ID.
- Check that the "Not Found" state is handled if a user ID doesn't exist.

### Manual Verification
- Verify that statistics are correctly calculated from the mock or real submission data.
- Check dark/light mode consistency.
- Ensure all Lucide icons and animations are working smoothly.
