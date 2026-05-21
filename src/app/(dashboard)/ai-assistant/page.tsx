import { AiChat } from '@/components/ai/AiChat';

export const metadata = { title: 'AI Assistant' };

export default function AiAssistantPage() {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] animate-fade-in">
      <div className="card h-full flex flex-col overflow-hidden">
        <AiChat />
      </div>
    </div>
  );
}
