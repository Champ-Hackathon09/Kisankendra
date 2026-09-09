-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "state" TEXT,
    "district" TEXT,
    "village" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Centre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "operationalStatus" TEXT NOT NULL DEFAULT 'NORMAL',
    "pauseReason" TEXT,
    "capacityPerHour" INTEGER NOT NULL DEFAULT 5,
    "currentWaitMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenNumber" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "cropType" TEXT NOT NULL,
    "estimatedWeight" REAL NOT NULL,
    "vehicleNumber" TEXT,
    "slotDate" TEXT NOT NULL,
    "slotTime" TEXT NOT NULL,
    "queuePosition" INTEGER NOT NULL DEFAULT 1,
    "estimatedWaitMinutes" INTEGER NOT NULL DEFAULT 20,
    "actualWeight" REAL,
    "moistureLevel" REAL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Token_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Token_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Centre_code_key" ON "Centre"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenNumber_key" ON "Token"("tokenNumber");
