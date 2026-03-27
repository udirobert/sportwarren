'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
      toast.error(err.message || 'Failed to submit ratings');
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
        <Card>
          <CardContent className="pt-6">
            <CardTitle>No Assignments</CardTitle>
            <CardDescription>You don't have any teammates to rate for this match, or the window is closed.</CardDescription>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
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
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="bg-primary/10 h-32 flex items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
              </div>
              <CardHeader className="text-center pt-10">
                <CardTitle className="text-3xl font-bold">Post-Match Scout Report</CardTitle>
                <CardDescription className="text-lg">
                  Rate your teammates' performance. Your objective feedback earns you Scout XP and helps them level up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
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
            <Card className="shadow-lg border-2 border-primary/10">
              <CardHeader className="flex flex-row items-center gap-4 border-b pb-6">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={currentTeammate.avatar} />
                  <AvatarFallback>{currentTeammate.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Badge variant="outline" className="mb-1">{currentTeammate.position}</Badge>
                  <CardTitle className="text-2xl">{currentTeammate.name}</CardTitle>
                  <CardDescription>Scouting {teammateIndex + 1} of {assignments.teammates.length}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                {assignments.attributes.map((attr) => (
                  <div key={attr} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{attr}</label>
                      <span className="text-xl font-black text-primary">{(ratings[currentTeammate.id]?.[attr] || 6)}</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[ratings[currentTeammate.id]?.[attr] || 6]}
                      onValueChange={(val) => handleRate(currentTeammate.id, attr, val[0])}
                      className="py-4"
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
                    <Button variant="outline" className="flex-1" onClick={() => setTeammateIndex(prev => prev - 1)}>
                      Back
                    </Button>
                  )}
                  <Button className="flex-[2] text-lg font-bold" onClick={nextTeammate}>
                    {isLastTeammate ? "Next: MOTM" : "Next Teammate"} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
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
            <Card className="shadow-lg border-2 border-yellow-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto bg-yellow-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl font-black">Man of the Match</CardTitle>
                <CardDescription>Who was the standout performer today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {assignments.teammates.map((t) => (
                    <Button
                      key={t.id}
                      variant={motmVote === t.id ? "default" : "outline"}
                      className={`h-16 justify-start gap-4 text-lg ${motmVote === t.id ? "ring-2 ring-yellow-500 ring-offset-2" : ""}`}
                      onClick={() => setMotmVote(t.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={t.avatar} />
                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                      </Avatar>
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
                  <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                    Back to Ratings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-12 border-2 border-green-500/20 shadow-2xl">
              <CardContent className="space-y-6">
                <div className="mx-auto bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-4xl font-black text-green-700">Scout Report Sent!</CardTitle>
                  <CardDescription className="text-lg font-medium">
                    You've earned <span className="text-primary font-black">+25 Scout XP</span> for your contribution.
                  </CardDescription>
                </div>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Teammate attributes will update once the rating window closes in 24 hours.
                </p>
                <div className="pt-6">
                  <Button className="px-12 h-12 text-lg font-bold" onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
