/*
  Warnings:

  - You are about to drop the column `deptId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fullName` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_deptId_fkey";

-- DropIndex
DROP INDEX "Student.email_unique";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "deptId",
DROP COLUMN "fullname",
ADD COLUMN     "dept" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Teacher";
