import { LEARN_CATEGORIES } from "../../../../lib/data/learnData";
import TopicClientPage from "./TopicClientPage";

export async function generateStaticParams() {
    const params: { category: string; topic: string }[] = [];
    for (const cat of LEARN_CATEGORIES) {
        for (const top of cat.topics) {
            params.push({
                category: cat.slug,
                topic: top.slug,
            });
        }
    }
    return params;
}

export default function TopicPage({ params }: { params: Promise<{ category: string; topic: string }> }) {
    return <TopicClientPage params={params} />;
}
