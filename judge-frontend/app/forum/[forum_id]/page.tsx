export default function ForumIDPage({
    params,
}: {
    params: { post_id: string };
}) {
    const { post_id } = params;

    return (
        <>
            <div>Post ID: {post_id}</div>
        </>
    );
}