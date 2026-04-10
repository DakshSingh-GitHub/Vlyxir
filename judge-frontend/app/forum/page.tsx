"use client";

import React, { useState } from 'react';
import ForumLayout from "../../components/forum/ForumLayout";
import ForumSidebar from "../../components/forum/ForumSidebar";
import ForumFeed from "../../components/forum/ForumFeed";
import ForumRightPanel from "../../components/forum/ForumRightPanel";

export default function ForumPage() {
    const [activeTab, setActiveTab] = useState('Trending');

    return (
        <ForumLayout>
            <ForumSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <ForumFeed activeTab={activeTab} setActiveTab={setActiveTab} />
            <ForumRightPanel />
        </ForumLayout>
    );
}
