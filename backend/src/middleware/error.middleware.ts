import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error("Error:", error);

    const status = error.status || 500;
    const message = error.message || "Internal server error";

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
};
