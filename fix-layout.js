const fs = require('fs');
const path = 'd:/Tech Sprout/StartupSaga2/startupsaga-stag/admin/src/app/dashboard/startups/[id]/edit/page.tsx';
let data = fs.readFileSync(path, 'utf8');

const lines = data.split(/\r?\n/);

// We know from view_file that line 732 is     </div> (index 731)
// We know from view_file that line 733 is     </div> (index 732)
// Line 734 is {/* Founders */} (index 733)
// We want to replace everything from index 733 to the end with our new Social & Web Card

const keptLines = lines.slice(0, 733);

const tailStr = `                    {/* Social & Web Card */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                                <ExternalLink className="h-3 w-3 text-white" />
                            </div>
                            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Social & Web</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                                    <Input
                                        type="url"
                                        value={formData.website_url || ""}
                                        onChange={(e) => handleChange("website_url", e.target.value)}
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pl-9 text-[11px] transition-all"
                                        placeholder="https://company.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Founder LinkedIn</Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                                    <Input
                                        type="url"
                                        value={formData.founder_linkedin || ""}
                                        onChange={(e) => handleChange("founder_linkedin", e.target.value)}
                                        className="h-9 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pl-9 text-[11px] transition-all"
                                        placeholder="linkedin.com/in/user"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}`;

fs.writeFileSync(path, keptLines.join('\n') + '\n' + tailStr);
console.log('Fixed successfully');
