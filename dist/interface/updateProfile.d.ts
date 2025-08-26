import { Response, Request } from 'express';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export declare function updateProfile(req: MulterRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=updateProfile.d.ts.map