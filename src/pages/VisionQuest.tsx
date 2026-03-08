import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Compass, Scroll, CheckCircle, ArrowRight } from "lucide-react";

const INTEGRITY_QUESTIONS = [
  {
    question: "A fellow nomad is stranded without accommodation. What do you do?",
    options: [
      "Help them find a place and offer your couch if needed",
      "Wish them luck and move on",
      "Ignore the situation",
    ],
    correct: 0,
  },
  {
    question: "You discover inaccurate info on a community event listing. You should:",
    options: [
      "Leave it — someone else will fix it",
      "Flag it and provide the correct details for Stardust points",
      "Use it to your advantage",
    ],
    correct: 1,
  },
  {
    question: "A conflict arises between two expedition members. As a community member, you:",
    options: [
      "Take sides with whoever you agree with",
      "Mediate calmly, ensuring no one gets left behind",
      "Remove both from the group",
    ],
    correct: 1,
  },
  {
    question: "You're leading a trip and bad weather forces a change of plans. You:",
    options: [
      "Cancel everything and blame the weather",
      "Adapt the itinerary, communicate openly, and keep morale high",
      "Continue regardless — plans are plans",
    ],
    correct: 1,
  },
  {
    question: "A new Initiate asks for guidance on the platform. Your response:",
    options: [
      "Tell them to figure it out themselves",
      "Share your knowledge generously — we rise by lifting others",
      "Charge them for mentorship",
    ],
    correct: 1,
  },
];

export default function VisionQuest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<"vision" | "quiz" | "complete">("vision");
  const [visionText, setVisionText] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    new Array(INTEGRITY_QUESTIONS.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);

  const wordCount = visionText.trim().split(/\s+/).filter(Boolean).length;

  const handleVisionSubmit = async () => {
    if (wordCount < 200) {
      toast({ title: "Too short", description: `You need at least 200 words (currently ${wordCount}).`, variant: "destructive" });
      return;
    }

    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({ vision_statement: visionText, vision_completed: true })
      .eq("user_id", user.id);

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setStep("quiz");
  };

  const handleQuizSubmit = async () => {
    const allCorrect = INTEGRITY_QUESTIONS.every((q, i) => quizAnswers[i] === q.correct);

    if (!allCorrect) {
      toast({
        title: "Not quite right",
        description: "You must answer all questions correctly. Review and try again — the Nomad way is about integrity.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;
    setSubmitting(true);

    await supabase
      .from("profiles")
      .update({ quiz_completed: true })
      .eq("user_id", user.id);

    // Trigger promotion to steward
    await supabase.rpc("promote_to_steward", { _user_id: user.id });

    setSubmitting(false);
    setStep("complete");
  };

  if (step === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl gradient-coral glow-coral">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">You're a Steward!</h1>
          <p className="text-muted-foreground">
            You've proven your integrity. Social Discovery, Beacons, and Event Verification are now unlocked.
          </p>
          <Button onClick={() => navigate("/social")} className="gradient-coral text-primary-foreground">
            Enter the Community <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        {step === "vision" ? (
          <Scroll className="h-6 w-6 text-primary" />
        ) : (
          <Compass className="h-6 w-6 text-primary" />
        )}
        <h1 className="text-2xl font-display font-bold">
          {step === "vision" ? "Vision Quest" : "Integrity Quiz"}
        </h1>
      </div>

      {step === "vision" && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-lg mb-2">Write Your Vision Statement</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us why you want to be part of this community. What values drive you? How will you contribute? (Minimum 200 words)
            </p>
            <Textarea
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              placeholder="I believe in building genuine connections across cultures..."
              className="min-h-[200px] bg-secondary/50 border-border"
            />
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${wordCount >= 200 ? "text-primary" : "text-muted-foreground"}`}>
                {wordCount}/200 words
              </span>
              <Button
                onClick={handleVisionSubmit}
                disabled={wordCount < 200 || submitting}
                className="gradient-coral text-primary-foreground"
              >
                {submitting ? "Saving..." : "Continue to Quiz"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "quiz" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Answer all 5 scenario questions correctly to unlock Steward access. 100% accuracy required.
          </p>

          {INTEGRITY_QUESTIONS.map((q, qi) => (
            <div key={qi} className="glass-card rounded-xl p-5">
              <p className="font-medium text-sm mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const newAnswers = [...quizAnswers];
                      newAnswers[qi] = oi;
                      setQuizAnswers(newAnswers);
                    }}
                    className={`w-full text-left text-sm p-3 rounded-lg transition-all ${
                      quizAnswers[qi] === oi
                        ? "bg-primary/20 border border-primary text-foreground"
                        : "bg-secondary/30 border border-border hover:bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button
            onClick={handleQuizSubmit}
            disabled={quizAnswers.includes(null) || submitting}
            className="w-full gradient-coral text-primary-foreground"
          >
            {submitting ? "Checking..." : "Submit Quiz"}
          </Button>
        </div>
      )}
    </div>
  );
}
