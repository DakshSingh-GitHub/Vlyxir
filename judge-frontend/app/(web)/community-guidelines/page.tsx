/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Metadata } from "next";
import { BackButton } from "@/components/General/BackButton";

export const metadata: Metadata = {
    title: "Community Guidelines | Vlyxir",
    description: "Our community guidelines and standards for a welcoming environment.",
};

export default function CommunityGuidelines() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-3xl mx-auto space-y-12">
                <div>
                    <BackButton />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Community Guidelines
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Welcome to Vlyxir! We are committed to providing a friendly, safe, and welcoming environment for all coders, regardless of level of experience, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.
                    </p>
                </div>

                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. Be Respectful and Welcoming</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Be kind to others:</strong> Do not insult or put down other community members. Harassment and other exclusionary behavior aren't acceptable.</li>
                            <li><strong>Constructive criticism:</strong> When reviewing code or answering questions, ensure your feedback is helpful, professional, and aimed at helping the person improve.</li>
                            <li><strong>Assume good intent:</strong> Remember that we are a global community with varying levels of English proficiency and cultural backgrounds.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Share Quality Content</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Stay on topic:</strong> Keep discussions relevant to coding, algorithms, computer science, and career development.</li>
                            <li><strong>Format your code:</strong> Use proper markdown code blocks when sharing snippets so others can easily read and help with your code.</li>
                            <li><strong>Do not post malicious code:</strong> Sharing code intended to harm, exploit, or cause performance degradation to users or the platform is strictly prohibited.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. Academic Honesty and Integrity</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Write your own solutions:</strong> While discussing approaches is encouraged, do not copy and paste solutions from other users or external sources to cheat on problems or contests.</li>
                            <li><strong>Don't leak contest solutions:</strong> Refrain from discussing active contest problems or sharing solutions until the contest has officially concluded.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. No Spam or Self-Promotion</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Avoid spamming:</strong> Do not post repetitive content, irrelevant links, or meaningless messages.</li>
                            <li><strong>Self-promotion:</strong> Avoid using the platform solely to promote your personal blog, YouTube channel, or paid products unless it provides immediate, substantial value to the ongoing discussion.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Enforcement and Reporting</h2>
                        <p className="text-muted-foreground">
                            If you experience or witness unacceptable behavior—or have any other concerns—please report it immediately using our platform's reporting features or by contacting the moderation team. 
                        </p>
                        <p className="text-muted-foreground">
                            Community moderators reserve the right to remove comments, posts, or solutions that do not adhere to these guidelines. Violations may result in temporary suspensions or permanent bans from the platform.
                        </p>
                    </section>
                </div>

                <div className="pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
