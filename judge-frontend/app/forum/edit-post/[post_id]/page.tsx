import EditPostClientPage from "./EditPostClientPage";

export async function generateStaticParams() {
    return [];
}

export default function EditPostPage({ params }: { params: Promise<{ post_id: string }> }) {
    return <EditPostClientPage params={params} />;
}
