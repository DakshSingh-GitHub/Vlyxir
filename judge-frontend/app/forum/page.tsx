"use client";

import React, { useState } from 'react';
import ForumLayout from "../../components/forum/ForumLayout";
import ForumSidebar from "../../components/forum/ForumSidebar";
import ForumFeed from "../../components/forum/ForumFeed";
import ForumRightPanel from "../../components/forum/ForumRightPanel";

export default function ForumPage() {
    const [activeTab, setActiveTab] = useState('All Posts');
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <ForumLayout>
            <ForumSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeChannelId={activeChannelId}
                setActiveChannelId={setActiveChannelId}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <ForumFeed
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeChannelId={activeChannelId}
                setActiveChannelId={setActiveChannelId}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <ForumRightPanel />
        </ForumLayout>
    );
}

