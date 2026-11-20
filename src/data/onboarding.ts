export interface OnboardingSlide {
  id: number;
  message: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    message: "Admitting you have an addiction is the first step to recovery",
  },
  {
    id: 2,
    message:
      "Staying truthful to yourself about your progress is the next step",
  },
  {
    id: 3,
    message:
      "We are humans and we all fail at some point, but coming back and working harder is better than quitting on yourself",
  },
];
