import { ClassDeclaration, CodeBlockWriter } from "ts-morph";
import { Model } from "../../../../../fileCreators/types";

// TODO: referential integrity?
// TODO: nested creates, connect, connectOrCreate

export function addCreateMethod(modelClass: ClassDeclaration, model: Model) {
  modelClass.addMethod({
    name: "create",
    isAsync: true,
    typeParameters: [{ name: "Q", constraint: `Prisma.Args<Prisma.${model.name}Delegate, "create">` }],
    parameters: [{ name: "query", type: "Q" }],
    returnType: `Promise<Prisma.Result<Prisma.${model.name}Delegate, Q, "create">>`,
    statements: (writer) => {
      fillDefaults(writer);
      addRecordsToIDB(writer, model);
      applyClausesAndReturnRecords(writer, model);
    },
  });
}

function fillDefaults(writer: CodeBlockWriter) {
  writer.writeLine("const record = await this.fillDefaults(query.data);");
}

function addRecordsToIDB(writer: CodeBlockWriter, model: Model) {
  writer.writeLine(`await this.client.db.add("${model.name}", record);`);
}

function applyClausesAndReturnRecords(writer: CodeBlockWriter, model: Model) {
  writer
    .write(`const recordsWithRelations = this.applySelectClause`)
    .write(`(await this.applyRelations([record], query), query.select);`);

  writer.writeLine(`return recordsWithRelations as Prisma.Result<Prisma.${model.name}Delegate, Q, "create">;`);
}