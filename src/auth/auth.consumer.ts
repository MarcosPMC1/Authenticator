import { Process, Processor } from "@nestjs/bull";
import { Job } from "bullmq";

@Processor('mail')
export class AuthConsumer {
    @Process('verification')
    sendEmailVerification(job: Job<unknown>){
        console.log(job.data)
    }
}