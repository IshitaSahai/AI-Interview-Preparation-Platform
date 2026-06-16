const {GoogleGenAI}=require("@google/genai")
const {z}=require("zod")
const {zodToJsonSchema}=require("zod-to-json-schema")
const puppeteer = require('puppeteer-core');
const chromium = require("@sparticuz/chromium");

const ai=new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})



async function invokeGeminiAI(){
    const response=await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:"Hello gemini ! Explain what is Interview ?"
    })

    console.log(response.text)

}



const interviewReportSchema=z.object({
    title:z.string().describe("The title of the job for which the interview report is generated."),
    matchScore:z.number().describe("A score between 0 to 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions:z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.") 
    })).describe("Technical questions that can be asked in the interview along with the points to cover, what approach to take etc."),
    behavioralQuestions:z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behaviorial questions that can be asked in the interview along with their intention and how to answer them."),
    skillGaps:z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium","high"]).describe("The severity of this skill gap, ie. how important is the skill for the job")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan:z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan e.g. data structure, system, design, mock interviews "),
        tasks: z.array(z.string()).describe("List of tasks to be done ont this day to follow the preparation plan e.g. read a specific book ")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    
}).strict();


async function generateInterviewReport({resume, selfDescription, jobDescription}) {

    // const prompt=`Generate an interview report for the candidate with the following details:
    //             Resume:${resume}
    //             Self describe:${selfdescription}
    //             Job describe: ${jobdescription}`
    const prompt = `
Analyze the candidate and generate an interview report.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return ONLY a JSON object matching the provided schema.

Important:

- technicalQuestions must be an array of 10 objects.
- Each technicalQuestions item must contain:
  question,
  intention,
  answer.

- behavioralQuestions must be an array of 5 objects.
- Each behavioralQuestions item must contain:
  question,
  intention,
  answer.

- skillGaps must be an array of objects.
- Each skillGaps item must contain:
  skill,
  severity.

- preparationPlan must be an array of 7 objects.
- Each preparationPlan item must contain:
  day,
  focus,
  tasks.

Do not return counts.
Do not return numbers for technicalQuestions, behavioralQuestions, skillGaps, or preparationPlan.

Return the complete data structure.
Example format:

{
  
"title": "Backend Engineer",

  "matchScore": 85,
  "technicalQuestions": [
    {
      "question": "What is React?",
      "intention": "Check React basics",
      "answer": "Explain React and component architecture"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Tell me about yourself",
      "intention": "Evaluate communication",
      "answer": "Use STAR method"
    }
  ],
  "skillGaps": [
    {
      "skill": "Docker",
      "severity": "medium"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "React",
      "tasks": ["Revise hooks", "Build mini project"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json"
    }
});

console.log(response.text);

const report = JSON.parse(response.text);

const validatedReport =
    interviewReportSchema.parse(report);

return validatedReport;
}

async function generatePdfFromHtml(htmlContent) {
  console.log(chromium);
    const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
});
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })
    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}


module.exports={ generateInterviewReport, generateResumePdf }