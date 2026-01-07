import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    shortDesc: string;
    longDesc: string;
    images: string[];
    contributors: mongoose.Types.ObjectId[];
    repoUrl: string;
    tags: string[];
    createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
    title: { type: String, required: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String },
    images: [{ type: String }],
    contributors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    repoUrl: { type: String },
    tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
