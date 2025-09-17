import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const faqs = [
    {
      question: "Do I need to know SQL to use ClarifaiSQL?",
      answer: "Nope. Just ask in plain English, we’ll handle the SQL for you. Our tool is designed for everyone, regardless of technical background."
    },
    {
      question: "What file formats are supported?",
      answer: "Currently, we support CSV files. Support for Excel, Google Sheets, and direct database connections is on our roadmap!"
    },
    {
      question: "How is ClarifaiSQL different from ChatGPT?",
      answer: "While ChatGPT is a general-purpose language model, ClarifaiSQL is a specialist. It’s fine-tuned specifically for understanding data schemas and generating accurate, executable SQL queries. It doesn’t just generate the query; it also runs it on your data and provides the answer."
    },
    {
      question: "Is my data safe?",
      answer: "Absolutely. Your data is processed in-memory during the request and is never stored on our servers. The connection is secure, and your information remains confidential."
    },
    {
      question: "Is ClarifaiSQL free to use?",
      answer: "Yes, this version of ClarifaiSQL is 100% free to use. We plan to introduce advanced features and team plans in the future."
    },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto py-12 px-4">
       <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Frequently Asked Questions</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions? We've got answers.
        </p>
      </div>
      <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}

