import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'bls_super_secret_session_token_key_12938123';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    
    // Check if user is active
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'User is inactive or deleted' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  }
};

export const logActivity = (action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            details: `User ${req.user.name} (${req.user.role}) performed: ${action} on ${req.originalUrl}. Payload: ${JSON.stringify(req.body).substring(0, 500)}`
          }
        }).catch(err => console.error('Error logging audit activity:', err));
      }
      return originalSend.call(this, body);
    };
    next();
  };
};
