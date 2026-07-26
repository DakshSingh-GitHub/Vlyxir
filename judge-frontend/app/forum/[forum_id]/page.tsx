import ForumIDClientPage from "./ForumIDClientPage";

export async function generateStaticParams() {
    return [];
}

export default function ForumIDPage({ params }: { params: Promise<{ forum_id: string }> }) {
    return <ForumIDClientPage params={params} />;
}