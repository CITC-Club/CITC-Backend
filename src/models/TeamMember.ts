import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
    name: string;
    role: string;
    category: 'mentor' | 'executiveCommittee';
    image?: string;
    bio?: string;
    social?: {
        email?: string;
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    order: number;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TeamMemberSchema: Schema = new Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: {
        type: String,
        enum: ['mentor', 'executiveCommittee'],
        required: true
    },
    image: { type: String },
    bio: { type: String },
    social: {
        email: { type: String },
        linkedin: { type: String },
        github: { type: String },
        twitter: { type: String }
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Index for efficient querying
TeamMemberSchema.index({ category: 1, order: 1 });
TeamMemberSchema.index({ isActive: 1 });

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
