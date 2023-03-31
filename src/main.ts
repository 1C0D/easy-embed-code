import { Plugin, MarkdownRenderer, TAbstractFile, TFile } from "obsidian";
import * as fs from "fs/promises";

export default class CodeEmbed extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"embed",
			async (source, el, ctx) => {
				const { vault } = this.app;
				const rows = source.split("\n");
				if (!rows[0] || rows[0].trim().length === 0) {
					const markdown = "```blank\n Embed code: No path\n```"
					MarkdownRenderer.renderMarkdown(markdown, el, "", this);
					return
				}

				const filename = rows[0].trim();
				let language = filename.split(".").pop();

				const file: TAbstractFile | null =
					vault.getAbstractFileByPath(filename);

				let fileContents = "";
				let fileExt = "";
				let markdown = "";

				if (!file) {
					fileContents = await this.extPath(filename);
					if (fileContents) fileExt = "extToVault";
				}

				if (!fileContents) {
					fileContents = file
						? await vault.cachedRead(file as TFile)
						: `Embed code: No path '${filename}'`;
				}

				if (rows[1]) {language = rows[1].trim()
				console.log("language", language)
				}

				if (!file && !fileExt) language = "blank"; // to stabilize error-block when editing
				markdown = "```" + language;
				markdown += "\n";
				markdown += fileContents

				if (fileContents.endsWith("\n")) {
					// if the file doesn't end with \n
					markdown += "```";
				} else {
					markdown += "\n```";
				}

				MarkdownRenderer.renderMarkdown(markdown, el, "", this);
			}
		);
	}


	async extPath(filename: string): Promise<string> {
		try {
			return await fs.readFile(filename, "utf8");
		} catch (err) {
			// console.error(err);
			return "";
		}
	}
}
