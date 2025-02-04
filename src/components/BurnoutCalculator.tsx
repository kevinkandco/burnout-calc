import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, TwitterIcon, LinkedinIcon, DownloadIcon, MailIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import BurnoutRecommendations from "./BurnoutRecommendations";
import BurnoutVisuals from "./BurnoutVisuals";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BurnoutInputs {
  hoursWorked: number;
  sleepHours: number;
  selfCareHours: number;
}

const BurnoutCalculator = () => {
  const [inputs, setInputs] = useState<BurnoutInputs>({
    hoursWorked: 40,
    sleepHours: 7,
    selfCareHours: 5,
  });
  const [showResults, setShowResults] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const calculateRiskScore = () => {
    const workLoad = inputs.hoursWorked / 40; // normalized to standard work week
    const sleepDeficit = (8 - inputs.sleepHours) / 8; // normalized to recommended sleep
    const selfCareDeficit = (10 - inputs.selfCareHours) / 10; // normalized to recommended self-care

    const score = (workLoad * 4 + sleepDeficit * 3 + selfCareDeficit * 3) / 10;
    return Math.min(Math.max(score, 0), 1) * 10; // Scale to 0-10
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: "Low", color: "text-sage-500" };
    if (score <= 6) return { level: "Moderate", color: "text-orange-500" };
    return { level: "High", color: "text-red-500" };
  };

  const getBurnoutWindow = (score: number) => {
    if (score <= 3) return "Low risk - maintain current balance";
    if (score <= 6) return "4-8 weeks if patterns continue";
    return "2-4 weeks if patterns continue";
  };

  const handleShare = async (platform: 'x' | 'linkedin' | 'download' | 'email') => {
    const score = calculateRiskScore();
    const { level } = getRiskLevel(score);
    const text = `I just checked my burnout risk level using the Burnout Calculator. My risk level is ${level} (${score.toFixed(1)}/10). Check yours too!`;
    const url = window.location.href;

    // Generate image first
    let imageUrl = '';
    if (exportRef.current) {
      try {
        const canvas = await html2canvas(exportRef.current);
        imageUrl = canvas.toDataURL();
      } catch (error) {
        toast({
          title: "Error generating image",
          description: "There was an error creating the share image",
          variant: "destructive",
        });
      }
    }

    switch (platform) {
      case 'x':
        // For Twitter/X, we'll need to first upload the image somewhere to get a URL
        // Since we can't directly attach the image, we'll just share the text for now
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        // LinkedIn's share API doesn't support direct image uploads
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
          '_blank'
        );
        break;
      case 'download':
        if (imageUrl) {
          const link = document.createElement('a');
          link.download = 'burnout-assessment.png';
          link.href = imageUrl;
          link.click();
          toast({
            title: "Download started",
            description: "Your assessment has been downloaded as a PNG file",
          });
        }
        break;
      case 'email':
        const subject = encodeURIComponent("My Burnout Risk Assessment Results");
        const body = encodeURIComponent(`${text}\n\nTry the calculator yourself at: ${url}`);
        // For email, we can't directly attach the image, but we could include it as a data URL
        // However, most email clients don't support this, so we'll stick to text
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        break;
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
    setIsOpen(false);
  };

  const handleReset = () => {
    setInputs({
      hoursWorked: 40,
      sleepHours: 7,
      selfCareHours: 5,
    });
    setShowResults(false);
    setIsOpen(true);
  };

  const score = calculateRiskScore();
  const riskLevel = getRiskLevel(score);
  const burnoutWindow = getBurnoutWindow(score);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-lg mb-6">
            <img 
              src="/lovable-uploads/2ba54d49-c430-40cf-b7f4-6109f7e05336.png" 
              alt="Sunsama Logo" 
              className="h-8 mx-auto"
            />
          </div>
          <h1 className="text-4xl font-light text-[#6E59A5]">Burnout Risk Calculator</h1>
          <p className="text-[#8E9196] max-w-md mx-auto">
            Assess your risk of burnout based on your work habits and self-care practices
          </p>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className={`p-6 shadow-lg bg-white/80 backdrop-blur-sm border-[#E5DEFF] ${showResults ? 'opacity-75' : ''}`}>
            <CollapsibleContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#7E69AB] flex items-center gap-2">
                      Hours Worked per Week
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-[#9b87f5]" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Standard work week is 40 hours</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <span className="text-sm text-[#8E9196]">{inputs.hoursWorked}h</span>
                  </div>
                  <Slider
                    value={[inputs.hoursWorked]}
                    min={0}
                    max={100}
                    step={1}
                    disabled={showResults}
                    onValueChange={(value) => !showResults && setInputs({ ...inputs, hoursWorked: value[0] })}
                    className={`w-full ${showResults ? 'cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#7E69AB] flex items-center gap-2">
                      Average Sleep per Night
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-[#9b87f5]" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Recommended sleep is 7-9 hours</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <span className="text-sm text-[#8E9196]">{inputs.sleepHours}h</span>
                  </div>
                  <Slider
                    value={[inputs.sleepHours]}
                    min={0}
                    max={12}
                    step={0.5}
                    disabled={showResults}
                    onValueChange={(value) => !showResults && setInputs({ ...inputs, sleepHours: value[0] })}
                    className={`w-full ${showResults ? 'cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#7E69AB] flex items-center gap-2">
                      Self-Care Hours per Week
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-[#9b87f5]" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Time spent on activities that help you relax and recharge</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <span className="text-sm text-[#8E9196]">{inputs.selfCareHours}h</span>
                  </div>
                  <Slider
                    value={[inputs.selfCareHours]}
                    min={0}
                    max={40}
                    step={0.5}
                    disabled={showResults}
                    onValueChange={(value) => !showResults && setInputs({ ...inputs, selfCareHours: value[0] })}
                    className={`w-full ${showResults ? 'cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </CollapsibleContent>

            <div className="flex flex-col gap-2 mt-4">
              {!isOpen && (
                <p className="text-center text-[#7E69AB] text-sm">Ready to reassess?</p>
              )}
              {!showResults ? (
                <Button
                  onClick={handleCalculate}
                  className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
                >
                  Calculate Risk
                </Button>
              ) : (
                <Button
                  onClick={handleReset}
                  className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white !opacity-100"
                >
                  Reset Calculator
                </Button>
              )}
            </div>
          </Card>
        </Collapsible>

        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <BurnoutRecommendations
              workHours={inputs.hoursWorked}
              sleepHours={inputs.sleepHours}
              selfCareHours={inputs.selfCareHours}
            />

            <BurnoutVisuals
              score={calculateRiskScore()}
              workHours={inputs.hoursWorked}
              sleepHours={inputs.sleepHours}
              selfCareHours={inputs.selfCareHours}
            />

            <div ref={resultsRef}>
              <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm border-[#E5DEFF]">
                <div className="space-y-6">
                  <div ref={exportRef} className="bg-white p-6 rounded-lg">
                    <div className="bg-white p-6 rounded-lg mb-6">
                      <img 
                        src="/lovable-uploads/2ba54d49-c430-40cf-b7f4-6109f7e05336.png" 
                        alt="Sunsama Logo" 
                        className="h-8 mx-auto"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-light text-[#6E59A5] mb-8">Your Results</h2>
                      <div className="flex items-start justify-center gap-12 mb-6">
                        <span className="text-6xl font-medium text-[#7E69AB] leading-none">
                          {calculateRiskScore().toFixed(1)}
                        </span>
                        <div className="text-left flex flex-col gap-3">
                          <span className={`text-2xl font-light ${getRiskLevel(calculateRiskScore()).color}`}>
                            {getRiskLevel(calculateRiskScore()).level} Risk
                          </span>
                          <div className="space-y-2">
                            <span className="text-[#8E9196] text-lg font-medium block">
                              Expected Impact:
                            </span>
                            <span className="text-[#7E69AB] text-lg block">
                              {getBurnoutWindow(calculateRiskScore())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share buttons section - outside exportRef */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleShare('x')}
                        variant="outline"
                        className="flex-1 border-[#E5DEFF] text-[#7E69AB] hover:bg-[#F1F0FB]"
                      >
                        <TwitterIcon className="w-4 h-4 mr-2" />
                        Share on X
                      </Button>
                      <Button
                        onClick={() => handleShare('linkedin')}
                        variant="outline"
                        className="flex-1 border-[#E5DEFF] text-[#7E69AB] hover:bg-[#F1F0FB]"
                      >
                        <LinkedinIcon className="w-4 h-4 mr-2" />
                        Share on LinkedIn
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleShare('download')}
                        variant="outline"
                        className="flex-1 border-[#E5DEFF] text-[#7E69AB] hover:bg-[#F1F0FB]"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleShare('email')}
                        variant="outline"
                        className="flex-1 border-[#E5DEFF] text-[#7E69AB] hover:bg-[#F1F0FB]"
                      >
                        <MailIcon className="w-4 h-4 mr-2" />
                        Share via Email
                      </Button>
                    </div>

                    <a
                      href="https://sunsama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
                        Try Sunsama Free
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            <p className="text-xs text-center text-[#8E9196]">
              Your data is not stored or shared. This assessment is for informational purposes only.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BurnoutCalculator;
