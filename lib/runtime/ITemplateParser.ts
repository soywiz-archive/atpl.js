import { TokenParserContextCommon } from '../parser/TokenParserContext';

export interface ITemplateParser {
    compile(path: string, runtimeContext: any, tokenParserContextCommon?: TokenParserContextCommon):any;
	compileString(templateString: string, runtimeContext:any): any;
}
