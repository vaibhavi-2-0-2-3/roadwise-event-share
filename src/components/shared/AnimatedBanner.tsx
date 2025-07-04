
import React from 'react';
import { Card } from '@/components/shared/CardBanner';


interface AnimatedBannerProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  className?: string;
  gradient?: string;
}

export const AnimatedBanner: React.FC<AnimatedBannerProps> = ({
  title,
  subtitle,
  children,
  className = "",
  gradient = "from-brand-500 via-brand-600 to-brand-700"
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Card className="border-0 shadow-2xl bg-gradient-to-br backdrop-blur-sm">
        <div className={`absolute inset-0 bg-gradient-to-br opacity-90 ${gradient}`} />


        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-8 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>
          {children && (
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {children}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
