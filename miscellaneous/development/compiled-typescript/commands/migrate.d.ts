import { Command } from '@oclif/core';
/**
 * Main migration command for the SmartUI Migration Tool
 * This is the primary entry point that orchestrates the entire migration process
 */
export default class Migrate extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'project-path': import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces").CustomOptions>;
        'dry-run': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        backup: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        verbose: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        yes: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        interactive: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'preview-only': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'confirm-each': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static args: {
        framework: import("@oclif/core/lib/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
    /**
     * Display evidence-based analysis report from the advanced scanner
     */
    private displayEvidenceBasedAnalysis;
    /**
     * Interactive flag selection method
     * Allows users to select flags through a menu system
     */
    private selectFlagsInteractively;
    /**
     * Validate flag combinations and show warnings
     */
    private validateFlagCombinations;
    /**
     * Convert user selection to DetectionResult format
     */
    private convertSelectionToDetectionResult;
}
//# sourceMappingURL=migrate.d.ts.map