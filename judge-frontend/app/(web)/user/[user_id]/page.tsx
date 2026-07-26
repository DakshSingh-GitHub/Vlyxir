import UserClientPage from "./UserClientPage";

export async function generateStaticParams() {
    return [];
}

export default function UserPage({ params }: { params: Promise<{ user_id: string }> }) {
    return <UserClientPage params={params} />;
}
