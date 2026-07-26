import InterviewClientPage from "./InterviewClientPage";

export async function generateStaticParams() {
  return [];
}

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  return <InterviewClientPage params={params} />;
}
