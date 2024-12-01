import { Model } from "../../../../../fileCreators/types";
import { ClassDeclaration } from "ts-morph";

// TODO: tx support

export function addFindFirstOrThrow(modelClass: ClassDeclaration, model: Model) {
  modelClass.addMethod({
    name: "findFirstOrThrow",
    isAsync: true,
    typeParameters: [{ name: "Q", constraint: `Prisma.Args<Prisma.${model.name}Delegate, "findFirstOrThrow">` }],
    parameters: [
      { name: "query", hasQuestionToken: true, type: "Q" },
      {
        name: "tx",
        hasQuestionToken: true,
        type: "IDBUtils.ReadonlyTransactionType | IDBUtils.ReadwriteTransactionType",
      },
    ],
    returnType: `Promise<Prisma.Result<Prisma.${model.name}Delegate, Q, "findFirstOrThrow">>`,
    statements: (writer) => {
      writer
        .writeLine(
          `tx = tx ?? this.client._db.transaction(Array.from(this._getNeededStoresForFind(query)), "readonly");`,
        )
        .writeLine(`const record = await this.findFirst(query, tx);`)
        .writeLine(`if (!record)`)
        .block(() => {
          writer.writeLine(`tx.abort();`).writeLine(`throw new Error("Record not found");`);
        })
        .writeLine(`return record;`);
    },
  });
}
