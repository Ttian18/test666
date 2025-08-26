import React, { useState } from "react";
import { AIButton } from "@/components/ui/ai-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ButtonShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleLoadingDemo = (buttonId: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <AIButton
          variant="ai_ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
          icon="none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </AIButton>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Button Component Showcase
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Enhanced button components with AI-themed animations and effects
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Primary AI Buttons */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✨ Primary AI Buttons
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AIButton
              variant="ai_primary"
              icon="sparkles"
              onClick={() => handleLoadingDemo('ai-primary')}
              loading={loadingStates['ai-primary']}
              loadingText="Processing..."
            >
              AI Primary
            </AIButton>
            
            <AIButton
              variant="neural"
              icon="brain"
              onClick={() => handleLoadingDemo('neural')}
              loading={loadingStates['neural']}
              loadingText="Thinking..."
            >
              Neural Network
            </AIButton>
            
            <AIButton
              variant="quantum"
              icon="zap"
              onClick={() => handleLoadingDemo('quantum')}
              loading={loadingStates['quantum']}
              loadingText="Computing..."
            >
              Quantum AI
            </AIButton>
          </CardContent>
        </Card>

        {/* Secondary Variants */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎨 Secondary Variants
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AIButton
              variant="ai_secondary"
              icon="star"
              onClick={() => handleLoadingDemo('ai-secondary')}
              loading={loadingStates['ai-secondary']}
            >
              AI Secondary
            </AIButton>
            
            <AIButton
              variant="ai_ghost"
              icon="sparkles"
              onClick={() => handleLoadingDemo('ai-ghost')}
              loading={loadingStates['ai-ghost']}
            >
              AI Ghost
            </AIButton>
            
            <AIButton
              variant="ai_primary"
              size="sm"
              icon="brain"
            >
              Small Size
            </AIButton>
          </CardContent>
        </Card>

        {/* Status Buttons */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚦 Status Buttons
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AIButton
              variant="success"
              icon="sparkles"
              onClick={() => handleLoadingDemo('success')}
              loading={loadingStates['success']}
              loadingText="Saving..."
            >
              Success Action
            </AIButton>
            
            <AIButton
              variant="warning"
              icon="zap"
              onClick={() => handleLoadingDemo('warning')}
              loading={loadingStates['warning']}
              loadingText="Warning..."
            >
              Warning Action
            </AIButton>
            
            <AIButton
              variant="destructive"
              icon="star"
              onClick={() => handleLoadingDemo('destructive')}
              loading={loadingStates['destructive']}
              loadingText="Deleting..."
            >
              Destructive Action
            </AIButton>
          </CardContent>
        </Card>

        {/* Size Variants */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📏 Size Variants
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <AIButton variant="ai_primary" size="sm" icon="sparkles">
              Small
            </AIButton>
            
            <AIButton variant="ai_primary" size="default" icon="brain">
              Default
            </AIButton>
            
            <AIButton variant="ai_primary" size="lg" icon="zap">
              Large
            </AIButton>
            
            <AIButton variant="ai_primary" size="xl" icon="star">
              Extra Large
            </AIButton>
          </CardContent>
        </Card>

        {/* Special Effects */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Special Effects
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AIButton
              variant="ai_primary"
              icon="sparkles"
              glow="medium"
              glowOnHover={true}
            >
              Glow Effect
            </AIButton>
            
            <AIButton
              variant="neural"
              icon="brain"
              pulseOnHover={true}
            >
              Pulse on Hover
            </AIButton>
            
            <AIButton
              variant="quantum"
              icon="zap"
              glow="strong"
            >
              Strong Glow
            </AIButton>
          </CardContent>
        </Card>

        {/* Icon Buttons */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔘 Icon Buttons
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <AIButton variant="ai_primary" size="icon" icon="sparkles" />
            <AIButton variant="neural" size="icon" icon="brain" />
            <AIButton variant="quantum" size="icon" icon="zap" />
            <AIButton variant="success" size="icon" icon="star" />
            <AIButton variant="ai_secondary" size="icon-lg" icon="sparkles" />
          </CardContent>
        </Card>

        {/* Integration Examples */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Integration Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <AIButton
                variant="ai_primary"
                icon="brain"
                onClick={() => handleLoadingDemo('ai-recommend')}
                loading={loadingStates['ai-recommend']}
                loadingText="Generating recommendations..."
              >
                🍽️ Get AI Recommendations
              </AIButton>
              
              <AIButton
                variant="neural"
                icon="zap"
                onClick={() => handleLoadingDemo('ai-budget')}
                loading={loadingStates['ai-budget']}
                loadingText="Analyzing budget..."
              >
                💰 Smart Budget Analysis
              </AIButton>
              
              <AIButton
                variant="quantum"
                icon="sparkles"
                onClick={() => handleLoadingDemo('ai-scan')}
                loading={loadingStates['ai-scan']}
                loadingText="Scanning receipt..."
              >
                📸 AI Receipt Scanner
              </AIButton>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Usage Example:</strong>
              </p>
              <code className="text-xs bg-white p-2 rounded border block">
                {`<AIButton 
  variant="ai_primary" 
  icon="brain" 
  loading={isLoading}
  loadingText="Processing..."
  onClick={handleAIAction}
>
  AI Action
</AIButton>`}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ButtonShowcase;
