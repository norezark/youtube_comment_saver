"use client";

import Channel from "@/components/channel";
import { Container, List, ListItem } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Channels() {
    const router = useRouter();

    const [channels, setChannels] = useState<ChannelProps[]>([]);

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/channels`);
            const json: ChannelsResponse = await response.json();
            setChannels(
                json.channels.map((channel) => ({
                    ...channel,
                    channelId: channel.id,
                    onClick: (channelId: string) => {
                        router.push(`/channels/${channelId}`);
                    },
                })),
            );
        })();
    }, []);

    return (
        <main>
            <Container maxWidth="md">
                <List>
                    {channels.map((channel) => (
                        <ListItem>
                            <Channel
                                channelId={channel.channelId}
                                title={channel.title}
                                description={channel.description}
                                thumbnails={channel.thumbnails}
                                onClick={channel.onClick}
                            />
                        </ListItem>
                    ))}
                </List>
            </Container>
        </main>
    );
}
