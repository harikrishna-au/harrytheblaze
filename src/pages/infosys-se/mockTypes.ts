// Shapes returned by the se-premium-content edge function (action: "mock").
// Types only: the questions themselves are never bundled with the website.

export type MockQuestion = {
  id: string;
  topic: string;
  stem: string;
  options: string[];
  answer: number;
  explain: string;
  code?: string;
  context?: string;
  contextTitle?: string;
};

export type MockSection = {
  id: string;
  name: string;
  minutes: number;
  blurb: string;
  questions: MockQuestion[];
};
