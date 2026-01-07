import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    rollNo?: string;
    semester?: string;
    role: 'admin' | 'mentor' | 'member' | 'guest';
    isVerified: boolean;
    avatarUrl?: string;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    rollNo: { type: String },
    semester: { type: String },
    role: {
        type: String,
        enum: ['admin', 'mentor', 'member', 'guest'],
        default: 'guest'
    },
    isVerified: { type: Boolean, default: false },
    avatarUrl: { type: String },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
    const user = this as unknown as IUser;
    if (!user.isModified('passwordHash')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    } catch (error) {
        throw error;
    }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
