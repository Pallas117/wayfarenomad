import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Compass, Scroll, CheckCircle, ArrowRight } from "lucide-react";
import { StarfieldBackground } from "@/components/animations/StarfieldBackground";
import { TypewriterText } from "@/components/animations/TypewriterText";
import { StardustParticles } from "@/components/animations/StardustParticles";
import { ConstellationBadge } from "@/components/animations/ConstellationBadge";
import { haptic } from "@/lib/haptics";

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

const PHILOSOPHICAL_QUOTES = [
  "\"The world is a book and those who do not travel read only one page.\" — Augustine of Hippo",
  "\"Not all those who wander are lost.\" — J.R.R. Tolkien",
  "\"The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.\" — Marcel Proust",
  "\"We travel not to escape life, but for life not to escape us.\" — Anonymous",
  "\"One's destination is never a place, but a new way of seeing things.\" — Henry Miller",
  "\"To move, to breathe, to fly, to float — to roam the roads of lands remote.\" — Willy Wonka",
  "\"Travel makes one modest. You see what a tiny place you occupy in the world.\" — Gustave Flaubert",
  "\"The journey of a thousand miles begins with a single step.\" — Lao Tzu",
];

const PROMPTS = [
  "Welcome, traveler. Unlock the world.",
  "Tell us why you belong among the stars...",
  "What values guide your journey? How will you lift others?",
];

function VisionStep({
  visionText,
  setVisionText,
  wordCount,
  onSubmit,
  submitting,
  jokeText,
  setJokeText,
}: {
  visionText: string;
  setVisionText: (v: string) => void;
  wordCount: number;
  onSubmit: () => void;
  submitting: boolean;
  jokeText: string;
  setJokeText: (v: string) => void;
}) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const intensity = Math.min(wordCount / 100, 1);
  const showParticles = wordCount >= 100;

  const handlePromptComplete = useCallback(() => {
    if (promptIndex < PROMPTS.length - 1) {
      setTimeout(() => setPromptIndex((p) => p + 1), 800);
    }
  }, [promptIndex]);

  return (
    <>
      <StarfieldBackground intensity={intensity} />

      <div className="relative z-10 space-y-6">
        {/* Typewriter prompts */}
        <div className="min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={promptIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-vision text-xl text-primary/90 italic"
            >
              <TypewriterText
                text={PROMPTS[promptIndex]}
                speed={50}
                onComplete={handlePromptComplete}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="glass-card rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="font-display font-semibold text-lg mb-2">Your Vision Statement</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Minimum 100 words — as you write, the cosmos awakens.
          </p>
          <Textarea
            value={visionText}
            onChange={(e) => setVisionText(e.target.value)}
            placeholder="I believe in building genuine connections across cultures..."
            className="min-h-[200px] bg-secondary/50 border-border transition-shadow duration-500"
            style={{
              boxShadow: wordCount >= 100
                ? "0 0 20px hsla(43, 72%, 52%, 0.2)"
                : "none",
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <motion.span
              className="text-xs font-medium"
              animate={{
                color: wordCount >= 100
                  ? "hsl(43 72% 52%)"
                  : "hsl(225 15% 55%)",
              }}
            >
              {wordCount}/100 words
            </motion.span>

            {/* Progress bar */}
            <div className="flex-1 mx-4 h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full gradient-gold rounded-full"
                animate={{ width: `${Math.min((wordCount / 100) * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>

            <Button
              ref={submitRef}
              onClick={onSubmit}
              disabled={wordCount < 100 || submitting}
              className="gradient-gold text-primary-foreground relative overflow-hidden"
            >
              {submitting ? "Saving..." : "Continue to Quiz"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Rotating philosophical quote */}
        <motion.div
          className="glass-card rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <RotatingQuote />
        </motion.div>

        {/* Tell us a joke */}
        <motion.div
          className="glass-card rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h2 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
            <span>😂</span> Tell Us a Joke
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Make us laugh! Show us your sense of humour — it's how we know you're human.
          </p>
          <Textarea
            value={jokeText}
            onChange={(e) => setJokeText(e.target.value)}
            placeholder="A nomad walks into a café in Lisbon..."
            className="min-h-[80px] bg-secondary/50 border-border"
            maxLength={500}
          />
        </motion.div>
      </div>

      <StardustParticles
        active={showParticles}
        targetRef={submitRef as React.RefObject<HTMLElement>}
        count={16}
      />
    </>
  );
}

function QuizStep({
  quizAnswers,
  setQuizAnswers,
  onSubmit,
  submitting,
}: {
  quizAnswers: (number | null)[];
  setQuizAnswers: (a: (number | null)[]) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-sm text-muted-foreground">
        Answer all 5 scenario questions correctly to unlock Steward access. 100% accuracy required.
      </p>

      {INTEGRITY_QUESTIONS.map((q, qi) => (
        <motion.div
          key={qi}
          className="glass-card rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: qi * 0.1 }}
        >
          <p className="font-medium text-sm mb-3">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <motion.button
                key={oi}
                onClick={() => {
                  const newAnswers = [...quizAnswers];
                  newAnswers[qi] = oi;
                  setQuizAnswers(newAnswers);
                }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left text-sm p-3 rounded-lg transition-all ${
                  quizAnswers[qi] === oi
                    ? "bg-primary/20 border border-primary text-foreground"
                    : "bg-secondary/30 border border-border hover:bg-secondary/50 text-muted-foreground"
                }`}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}

      <Button
        onClick={onSubmit}
        disabled={quizAnswers.includes(null) || submitting}
        className="w-full gradient-gold text-primary-foreground"
      >
        {submitting ? "Checking..." : "Submit Quiz"}
      </Button>
    </motion.div>
  );
}

function CompleteStep({ visionText }: { visionText: string }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        className="text-center space-y-6 max-w-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {/* Constellation badge morphed from vision text */}
        <div className="flex justify-center">
          <ConstellationBadge seed={visionText.slice(0, 100)} size={100} animate />
        </div>

        <motion.div
          className="inline-flex items-center justify-center h-20 w-20 rounded-2xl gradient-gold glow-gold-strong mx-auto"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <CheckCircle className="h-10 w-10 text-primary-foreground" />
        </motion.div>

        <motion.h1
          className="text-3xl font-display font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          You're a Steward!
        </motion.h1>

        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Your constellation is forged. Social Discovery, Beacons, and Event Verification are now unlocked.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Button onClick={() => navigate("/social")} className="gradient-gold text-primary-foreground">
            Enter the Community <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      <StarfieldBackground intensity={1} />
    </div>
  );
}

export default function VisionQuest() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"vision" | "quiz" | "complete">("vision");
  const [visionText, setVisionText] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    new Array(INTEGRITY_QUESTIONS.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);

  const wordCount = visionText.trim().split(/\s+/).filter(Boolean).length;

  const handleVisionSubmit = async () => {
    if (wordCount < 100) {
      toast({ title: "Too short", description: `You need at least 100 words (currently ${wordCount}).`, variant: "destructive" });
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
    haptic("success");
    setStep("quiz");
  };

  const handleQuizSubmit = async () => {
    const allCorrect = INTEGRITY_QUESTIONS.every((q, i) => quizAnswers[i] === q.correct);
    if (!allCorrect) {
      toast({
        title: "Not quite right",
        description: "You must answer all questions correctly. Review and try again.",
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

    await supabase.rpc("promote_to_steward", { _user_id: user.id });

    setSubmitting(false);
    haptic("shimmer");
    setStep("complete");
  };

  if (step === "complete") {
    return <CompleteStep visionText={visionText} />;
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto relative">
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {step === "vision" ? (
          <Scroll className="h-6 w-6 text-primary" />
        ) : (
          <Compass className="h-6 w-6 text-primary" />
        )}
        <h1 className="text-2xl font-display font-bold">
          {step === "vision" ? "Vision Quest" : "Integrity Quiz"}
        </h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "vision" && (
          <VisionStep
            key="vision"
            visionText={visionText}
            setVisionText={setVisionText}
            wordCount={wordCount}
            onSubmit={handleVisionSubmit}
            submitting={submitting}
          />
        )}
        {step === "quiz" && (
          <QuizStep
            key="quiz"
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            onSubmit={handleQuizSubmit}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
