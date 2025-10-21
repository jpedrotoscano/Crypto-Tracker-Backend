import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!email && !password) {
            return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
        }

        if (!email) {
            return NextResponse.json({ error: "Email é obrigatório!" }, { status: 400 })
        }

        if (!password) {
            return NextResponse.json({ error: "Senha é obrigatória!" }, { status: 400 })
        }

        // Verify if email is already used
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "Esse email já está em uso!" }, { status: 400 })
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        return NextResponse.json(
            { message: "Usuário registrado com sucesso!", user: { id: user.id, email: user.email } },
            { status: 201 }
        )
    } catch (error) {
        console.error("Erro ao registrar usuário: ", error)
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}
