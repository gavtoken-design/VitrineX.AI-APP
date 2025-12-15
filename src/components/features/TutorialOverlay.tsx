

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useTutorial } from '../../contexts/TutorialContext';
import Button from '../ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TutorialOverlay: React.FC = () => {
  const { isActive, steps, currentStepIndex, nextStep, prevStep, skipTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const currentStep = steps[currentStepIndex];

  // Update position when step changes or window resizes
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTargetRect(element.getBoundingClientRect());
      } else {
        // Fallback for missing elements (e.g. hidden sidebar on mobile)
        setTargetRect(null);
      }
    };

    // Small delay to allow UI to settle/scroll
    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearTimeout(timer);
    };
  }, [isActive, currentStepIndex, currentStep]);

  if (!isActive || !currentStep) return null;

  // Calculate Tooltip Position
  const getTooltipStyle = () => {
    if (!targetRect) {
      // Center if no target
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const gap = 16;
    const tooltipWidth = 320; // Approx max width
    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'right':
        top = targetRect.top + targetRect.height / 2 - 100; // Offset slightly up
        left = targetRect.right + gap;
        break;
      case 'left':
        top = targetRect.top;
        left = targetRect.left - tooltipWidth - gap;
        break;
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = targetRect.top - 200 - gap; // Approx height
        left = targetRect.left;
        break;
      default: // Center fallback
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }

    // Safety check to keep inside viewport (simplified)
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 10;
    if (top < 10) top = 10;

    return { top: `${top}px`, left: `${left}px`, position: 'absolute' as const };
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Dimmed Background with Cutout using CSS box-shadow trick or Clip-path */}
      {/* We use a simple approach: A semi-transparent overlay everywhere, 
          and a "hole" created by a separate highlighted div for the target */}

      <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 pointer-events-auto"></div>

      {targetRect && (
        <div
          className="absolute bg-transparent transition-all duration-300 ease-in-out border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-lg pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        >
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
        </div>
      )}

      {/* Tooltip Card */}
      <div
        className="absolute bg-surface p-6 rounded-xl shadow-2xl border border-border w-[320px] pointer-events-auto transition-all duration-300 flex flex-col animate-zoom-in"
        style={getTooltipStyle() as React.CSSProperties}
      >
        <button
          onClick={skipTutorial}
          className="absolute top-3 right-3 text-muted hover:text-title"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="mb-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
        </div>

        <h3 className="text-lg font-bold text-title mb-2">{currentStep.title}</h3>
        <p className="text-sm text-body leading-relaxed mb-6">{currentStep.content}</p>

        <div className="flex justify-between items-center mt-auto">
          <Button
            onClick={prevStep}
            variant="ghost"
            size="sm"
            disabled={currentStepIndex === 0}
          >
            Anterior
          </Button>
          <Button
            onClick={nextStep}
            variant="primary"
            size="sm"
          >
            {currentStepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
