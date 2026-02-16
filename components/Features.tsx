import React from 'react';
import { Bot, Globe, Zap, BarChart3, Lock } from 'lucide-react';

const FeatureCard: React.FC<{
    title: string;
    desc: string;
    icon: React.ReactNode;
    className?: string;
    delay?: string
}> = ({ title, desc, icon, className = "", delay = "0s" }) => (
    <div
        className={`group relative p-6 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${className}`}
        style={{ animationDelay: delay }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-cyan-400">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const Features: React.FC = () => {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="mb-12">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 mb-6">
                    Intelligence, <br />Integrated.
                </h2>
                <p className="text-zinc-400 max-w-2xl text-lg">
                    We don't just build websites. We build digital ecosystems powered by next-generation AI agents that work while you sleep.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
                {/* Large Card */}
                <FeatureCard
                    title="Custom AI Agents"
                    desc="Deploy intelligent voice and text agents trained on your business data. 24/7 customer support, lead qualification, and scheduling."
                    icon={<Bot className="w-6 h-6" />}
                    className="md:col-span-2 md:row-span-2 bg-zinc-900/80"
                />

                <FeatureCard
                    title="Smart Websites"
                    desc="High-performance, SEO-optimized web applications built with React and Next.js."
                    icon={<Globe className="w-6 h-6" />}
                />

                <FeatureCard
                    title="Workflow Automation"
                    desc="Connect your CRM, Email, and Calendar into one seamless automated flow."
                    icon={<Zap className="w-6 h-6" />}
                />

                <FeatureCard
                    title="Data Analytics"
                    desc="Real-time insights into user behavior and agent performance."
                    icon={<BarChart3 className="w-6 h-6" />}
                />

                <FeatureCard
                    title="Enterprise Security"
                    desc="Bank-grade encryption and secure data handling for all AI interactions."
                    icon={<Lock className="w-6 h-6" />}
                    className="md:col-span-2"
                />
            </div>
        </section>
    );
};

export default Features;
