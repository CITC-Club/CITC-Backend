import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    type: 'workshop' | 'hackathon' | 'tech-talk' | 'coding-challenge';
    startAt: Date;
    endAt: Date;
    location: string;
    capacity: number;
    image?: string;
    tags: string[];
    organizer?: string;
    attachments: string[];
    attendees: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['workshop', 'hackathon', 'tech-talk', 'coding-challenge'],
        required: true
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    image: { type: String },
    tags: [{ type: String }],
    organizer: { type: String },
    attachments: [{ type: String }],
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);
