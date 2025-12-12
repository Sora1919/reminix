/*
  Warnings:

  - A unique constraint covering the columns `[eventId,userId]` on the table `Collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Collaborator_eventId_userId_key` ON `Collaborator`(`eventId`, `userId`);
