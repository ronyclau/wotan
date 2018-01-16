import { AbstractRule } from '../types';
import * as ts from 'typescript';
import { getControlFlowEnd, WrappedAst, getWrappedNodeAtPosition, isTryStatement } from 'tsutils';

export class Rule extends AbstractRule {
    public static supports(sourceFile: ts.SourceFile) {
        return !sourceFile.isDeclarationFile;
    }

    public apply() {
        const re = /\bfinally\s*[/{]/g;
        let wrappedAst: WrappedAst | undefined;
        for (let match = re.exec(this.sourceFile.text); match !== null; match = re.exec(this.sourceFile.text)) {
            const {node} = getWrappedNodeAtPosition(wrappedAst || (wrappedAst = this.context.getWrappedAst()), match.index)!;
            if (isTryStatement(node) && node.finallyBlock !== undefined && node.finallyBlock.pos === match.index + 'finally'.length)
                for (const statement of getControlFlowEnd(node.finallyBlock).statements)
                    this.addFailureAtNode(
                        statement.getChildAt(0, this.sourceFile),
                        "Unsafe use of control flow statement inside 'finally'.",
                    );
        }
    }
}
