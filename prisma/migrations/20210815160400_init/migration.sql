-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "fullname" TEXT,
    "dept" TEXT,
    "enrolled" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);
