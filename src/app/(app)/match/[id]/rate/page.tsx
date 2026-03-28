'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Star, CheckCircle2, Trophy, Loader2, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RateTeammatesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const matchId = params.id;
  const [step, setStep] = useState(0); // 0: Welcome, 1: Rate Teammates, 2: MOTM, 3: Success
  const [teammateIndex, setTeammateIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({});
  const [motmVote, setMotmVote] = useState<string | null>(null);

  const { data: assignments, isLoading } = trpc.peerRating.getMyAssignments.useQuery({ matchId });
  const submitMutation = trpc.peerRating.submit.useMutation({
    onSuccess: () => {
      setStep(3);
    },
    onError: (err) => {
      console.error(err.message || 'Failed to submit ratings');
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-12 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!assignments || assignments.teammates.length === 0) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <Card className="p-6">
          <h3 className="text-xl font-bold">No Assignments</h3>
          <p className="text-muted-foreground mt-2">You don't have any teammates to rate for this match, or the window is closed.</p>
          <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const currentTeammate = assignments.teammates[teammateIndex];
  const isLastTeammate = teammateIndex === assignments.teammates.length - 1;

  const handleRate = (teammateId: string, attr: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [teammateId]: {
        ...(prev[teammateId] || {}),
        [attr]: value
      }
    }));
  };

  const nextTeammate = () => {
    if (isLastTeammate) {
      setStep(2);
    } else {
      setTeammateIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    const flatRatings = Object.entries(ratings).flatMap(([targetId, attrs]) => 
      Object.entries(attrs).map(([attribute, score]) => ({
        targetId,
        attribute,
        score
      }))
    );

    submitMutation.mutate({
      matchId,
      ratings: flatRatings,
      motmVote: motmVote || undefined
    });
  };

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden p-0">
              <div className="bg-primary/10 h-32 flex items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="text-center pt-10 px-6">
                <h3 className="text-3xl font-bold">Post-Match Scout Report</h3>
                <p className="text-lg text-muted-foreground mt-2">
                  Rate your teammates' performance. Your objective feedback earns you Scout XP and helps them level up.
                </p>
              </div>
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                    <div className="bg-primary/20 p-2 rounded-full"><User className="w-5 h-5 text-primary" /></div>
                    <div className="text-sm font-medium">Rate {assignments.teammates.length} Teammates</div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                    <div className="bg-primary/20 p-2 rounded-full"><Star className="w-5 h-5 text-primary" /></div>
                    <div className="text-sm font-medium">Earn Scout Reputation</div>
                  </div>
                </div>
                <Button className="w-full text-lg h-12" onClick={() => setStep(1)}>
                  Start Scouting <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="rating"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="shadow-lg border-2 border-primary/10 p-0">
              <div className="flex flex-row items-center gap-4 border-b pb-6 p-6">
                <div className="h-16 w-16 border-2 border-primary/20 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold">
                  {currentTeammate.avatar ? (
                    <img src={currentTeammate.avatar} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    currentTeammate.name[0]
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center rounded-md border border-gray-700 px-2 py-0.5 text-xs font-semibold mb-1 text-gray-400">{currentTeammate.position}</span>
                  <h3 className="text-2xl font-bold">{currentTeammate.name}</h3>
                  <p className="text-sm text-muted-foreground">Scouting {teammateIndex + 1} of {assignments.teammates.length}</p>
                </div>
              </div>
              <div className="pt-6 space-y-8 p-6">
                {assignments.attributes.map((attr) => (
                  <div key={attr} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{attr}</label>
                      <span className="text-xl font-black text-primary">{(ratings[currentTeammate.id]?.[attr] || 6)}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={ratings[currentTeammate.id]?.[attr] || 6}
                      onChange={(e) => handleRate(currentTeammate.id, attr, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Poor</span>
                      <span>Average</span>
                      <span>Elite</span>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-4 pt-4">
                  {teammateIndex > 0 && (
                    <Button variant="secondary" className="flex-1" onClick={() => setTeammateIndex(prev => prev - 1)}>
                      Back
                    </Button>
                  )}
                  <Button className="flex-[2] text-lg font-bold" onClick={nextTeammate}>
                    {isLastTeammate ? "Next: MOTM" : "Next Teammate"} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="motm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-lg border-2 border-yellow-500/20 p-6">
              <div className="text-center">
                <div className="mx-auto bg-yellow-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-black uppercase">Man of the Match</h3>
                <p className="text-sm text-muted-foreground mb-6">Who was the standout performer today?</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {assignments.teammates.map((t) => (
                    <Button
                      key={t.id}
                      variant={motmVote === t.id ? "primary" : "secondary"}
                      className={`h-16 justify-start gap-4 text-lg ${motmVote === t.id ? "ring-2 ring-yellow-500 ring-offset-2" : ""}`}
                      onClick={() => setMotmVote(t.id)}
                    >
                      <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {t.avatar ? (
                          <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          t.name[0]
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">{t.name}</span>
                        <span className="text-xs opacity-70">{t.position}</span>
                      </div>
                      {motmVote === t.id && <CheckCircle2 className="ml-auto w-6 h-6 text-white" />}
                    </Button>
                  ))}
                </div>

                <div className="pt-6 space-y-3">
                  <Button 
                    className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90" 
                    disabled={submitMutation.isPending}
                    onClick={handleSubmit}
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                    )}
                    Submit Report
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => setStep(1)}>
                    Back to Ratings
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
          <Card className="text-center py-12 border-2 border-green-500/20 shadow-2xl p-6">
              <div className="space-y-6">
                <div className="mx-auto bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-green-700">Scout Report Sent!</h3>
                  <p className="text-lg font-medium">
                    You've earned <span className="text-primary font-black">+25 Scout XP</span> for your contribution.
                  </p>
                </div>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Teammate attributes will update once the rating window closes in 24 hours.
                </p>
                <div className="pt-6">
                  <Button className="px-12 h-12 text-lg font-bold" onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
