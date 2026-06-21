import React from 'react';
import { Heart, Users, BarChart3, BrainCircuit, Dna, Clock, Activity, Kanban as KanbanIcon } from 'lucide-react';

const features = [
  { icon: Users, label: 'Lead Management', desc: 'Add, edit, track, and score leads with a smart scoring engine.' },
  { icon: KanbanIcon, label: 'Kanban Board', desc: 'Drag-and-drop pipeline to move leads through stages visually.' },
  { icon: BarChart3, label: 'Analytics', desc: 'Charts and breakdowns to understand your sales funnel at a glance.' },
  { icon: BrainCircuit, label: 'AI Insights', desc: 'Intelligent predictions and recommendations powered by your data.' },
  { icon: Activity, label: 'Cross Insights', desc: 'Spot stale leads and engagement gaps before they cost you.' },
  { icon: Clock, label: 'Golden Hour', desc: 'Find the best time of day to contact your leads for maximum success.' },
  { icon: Dna, label: 'Conversion DNA', desc: 'Decode the traits that make your leads convert and replicate them.' },
];

const About = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-14 animate-fade-in pb-32">

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/15 border border-accent/30 shadow-[0_0_40px_rgba(132,204,22,0.15)] mb-2">
          <span className="text-4xl font-black text-accent">M</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Mini CRM</h1>
        <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
          A modern, full-stack Customer Relationship Management dashboard built to help you capture, nurture, and convert leads — all from one sleek interface.
        </p>
      </div>

      {/* Builder Card */}
      <div className="bg-dark-card border border-accent/20 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(132,204,22,0.1)] animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center text-dark-bg text-2xl font-black shadow-lg">
          AS
        </div>
        <h2 className="text-2xl font-bold text-white">Built by Aryan Sharma</h2>
        <p className="text-gray-400 text-center max-w-md leading-relaxed">
          Designed and developed as a full-stack project showcasing React, Node.js, Express, and MySQL — with a focus on clean UI, dark-mode aesthetics, and intelligent data-driven features.
        </p>
      </div>

      {/* Features Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-white text-center">What's Inside</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, idx) => (
            <div
              key={f.label}
              className="flex items-start gap-4 p-5 bg-dark-card border border-dark-border rounded-xl hover:border-accent/30 hover:shadow-[0_0_15px_rgba(132,204,22,0.08)] transition-all animate-slide-up"
              style={{ animationDelay: `${100 + idx * 80}ms` }}
            >
              <div className="p-2.5 bg-accent/10 rounded-lg text-accent shrink-0">
                <f.icon size={20} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4 text-center animate-slide-up" style={{ animationDelay: '700ms' }}>
        <h2 className="text-xl font-semibold text-white">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {['React', 'Vite', 'Tailwind CSS v4', 'Node.js', 'Express', 'MySQL', 'Recharts', 'Lucide Icons'].map(tech => (
            <span key={tech} className="px-4 py-1.5 bg-dark-card border border-dark-border rounded-full text-xs font-medium text-gray-300">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-gray-600 text-xs flex items-center justify-center gap-1 pt-4">
        Made with <Heart size={12} className="text-red-500" /> by Aryan Sharma
      </div>

    </div>
  );
};

export default About;
