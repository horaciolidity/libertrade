const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, saldoReal: true, role: true },
  });
  res.json(users);
};

exports.depositToUser = async (req, res) => {
  const { userId, amount } = req.body;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { saldoReal: { increment: amount } },
  });

  await prisma.deposit.create({
    data: {
      amount,
      userId
    }
  });

  res.json({ message: 'Deposit successful', user });
};
