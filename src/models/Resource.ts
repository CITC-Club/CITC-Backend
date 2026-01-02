import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
    title: string;
    fileUrl: string;
    category: string;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ResourceSchema: Schema = new Schema({
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    category: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IResource>('Resource', ResourceSchema);
