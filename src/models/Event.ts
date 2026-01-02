import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    startAt: Date;
    endAt: Date;
    location: string;
    capacity: number;
    attachments: string[];
    attendees: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    attachments: [{ type: String }],
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);
