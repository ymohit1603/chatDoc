import { User } from "@prisma/client";
import prisma from "@/lib/prisma"

export async function createUser(data: User) {
    const { id, email } = data;
    try {
      const user = await prisma.user.create({
        data: {
          id:id,
          email:email,
        },
      });
      console.log('User created:', user);
    } catch (err) {
      console.error('Error creating user:', err);
      return new Response('Error occurred during user creation', { status: 500 });
    }
    
}