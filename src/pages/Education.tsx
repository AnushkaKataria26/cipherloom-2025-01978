import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Play, Calculator, Award, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const courses = [
  {
    title: "Crypto Basics",
    level: "Beginner",
    duration: "2 hours",
    icon: BookOpen,
    description: "Learn the fundamentals of cryptocurrency, blockchain technology, and how digital currencies work.",
    lessons: [
      "What is Cryptocurrency?",
      "Understanding Blockchain Technology",
      "Wallets and Private Keys",
      "How to Buy Your First Crypto",
      "Security Best Practices"
    ]
  },
  {
    title: "Trading Strategies",
    level: "Intermediate",
    duration: "4 hours",
    icon: Play,
    description: "Master various trading strategies including day trading, swing trading, and long-term investing.",
    lessons: [
      "Market Analysis Fundamentals",
      "Chart Patterns and Trends",
      "Risk Management Techniques",
      "Trading Psychology",
      "Creating Your Trading Plan"
    ]
  },
  {
    title: "Technical Analysis",
    level: "Advanced",
    duration: "6 hours",
    icon: Calculator,
    description: "Deep dive into technical indicators, advanced chart analysis, and quantitative trading methods.",
    lessons: [
      "Advanced Chart Patterns",
      "Technical Indicators (RSI, MACD, Bollinger Bands)",
      "Volume Analysis",
      "Support and Resistance Levels",
      "Automated Trading Strategies"
    ]
  },
];

export default function Education() {
  const { toast } = useToast();

  const handleStartCourse = (courseTitle: string) => {
    toast({
      title: "Course starting",
      description: `Loading ${courseTitle}...`,
    });
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Education</h1>
          </header>
          
          <main className="p-6 space-y-6">
            <Card className="bg-gradient-primary border-0 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-2xl">Learn Crypto Trading</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Master cryptocurrency trading with our comprehensive courses and tutorials</p>
                <Button variant="secondary" onClick={() => handleStartCourse("Crypto Trading 101")}>Get Started</Button>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              {courses.map((course, idx) => (
                <Card key={idx} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <course.icon className="h-5 w-5 text-cipher-blue" />
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="lessons" className="border-border">
                        <AccordionTrigger className="text-sm font-medium">Course Content</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {course.lessons.map((lesson, lessonIdx) => (
                              <li key={lessonIdx} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-profit mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{lesson}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <Button className="w-full" onClick={() => handleStartCourse(course.title)}>Start Learning</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Progress</CardTitle>
                <Award className="h-5 w-5 text-cipher-cyan" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Complete courses to earn certificates and track your learning journey</p>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
