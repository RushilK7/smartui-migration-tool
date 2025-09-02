# SmartUI Migration Tool - Deployment Checklist

## 🚀 **npmjs Deployment**

### **Pre-deployment Checklist**
- [ ] npm account created and verified
- [ ] 2FA enabled on npm account
- [ ] Package name availability confirmed (`smartui-migration-tool`)
- [ ] All tests passing (`pnpm test`)
- [ ] Build successful (`pnpm build`)
- [ ] Package configuration verified in `package.json`

### **Deployment Steps**
```bash
# 1. Login to npm
npm login

# 2. Build the project
pnpm build

# 3. Verify package contents
npm pack --dry-run

# 4. Publish to npm
npm publish

# 5. Verify publication
npm view smartui-migration-tool
```

### **Post-deployment Verification**
- [ ] Package appears on npmjs.com
- [ ] Installation works: `npm install -g smartui-migration-tool`
- [ ] CLI command works: `smartui-migrator --help`
- [ ] All functionality tested

---

## 🐙 **GitHub Repository Setup**

### **Pre-deployment Checklist**
- [ ] GitHub account created
- [ ] Repository name available (`smartui-migration-tool`)
- [ ] Local git repository initialized
- [ ] All files committed
- [ ] README.md updated and polished

### **Repository Creation Steps**
1. **Create Repository on GitHub:**
   - Go to github.com → New repository
   - Name: `smartui-migration-tool`
   - Description: "A sophisticated CLI tool to migrate visual testing suites to LambdaTest SmartUI"
   - Public repository
   - MIT License
   - No README (we have one)

2. **Connect Local Repository:**
   ```bash
   git remote add origin https://github.com/lambdatest/smartui-migration-tool.git
   git branch -M main
   git push -u origin main
   ```

3. **Configure Repository Settings:**
   - Add repository description
   - Add topics: `smartui`, `migration`, `visual-testing`, `percy`, `applitools`, `sauce-labs`, `lambdatest`, `cli`
   - Set up branch protection rules
   - Enable GitHub Actions

### **Post-deployment Verification**
- [ ] Repository accessible on GitHub
- [ ] README displays correctly
- [ ] All files uploaded
- [ ] GitHub Actions workflow configured

---

## 🏷️ **GitHub Releases Setup**

### **First Release Creation**
```bash
# 1. Create and push tag
git tag v1.0.0
git push origin v1.0.0

# 2. GitHub Actions will automatically:
#    - Build the project
#    - Package executables for all platforms
#    - Create GitHub release
#    - Upload binary files
```

### **Release Verification**
- [ ] GitHub release created
- [ ] All platform executables uploaded
- [ ] Release notes generated
- [ ] Download links working

---

## 🔄 **Update Workflow**

### **For npm Updates**
```bash
# 1. Make changes and test
pnpm test
pnpm build

# 2. Update version
npm version patch  # or minor, major

# 3. Publish update
npm publish
```

### **For GitHub Releases**
```bash
# 1. Make changes and test
pnpm test
pnpm build

# 2. Commit changes
git add .
git commit -m "feat: new feature description"
git push

# 3. Create new release
git tag v1.0.1
git push origin v1.0.1
```

---

## 📊 **Monitoring and Maintenance**

### **npmjs Monitoring**
- [ ] Monitor download statistics
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Respond to issues and feedback
- [ ] Update dependencies regularly

### **GitHub Monitoring**
- [ ] Monitor repository stars and forks
- [ ] Respond to issues and pull requests
- [ ] Update documentation as needed
- [ ] Monitor GitHub Actions workflow runs

---

## 🎯 **Success Criteria**

### **npmjs Success**
- ✅ Package successfully published
- ✅ Installation works globally
- ✅ CLI command accessible
- ✅ All functionality working

### **GitHub Success**
- ✅ Repository publicly accessible
- ✅ README displays correctly
- ✅ GitHub Actions workflow working
- ✅ Releases with binaries created

### **Integration Success**
- ✅ npm package links to GitHub
- ✅ GitHub repository links to npm
- ✅ Users can install from both sources
- ✅ Documentation is comprehensive

---

## 🚨 **Troubleshooting**

### **Common npm Issues**
- **Authentication**: Ensure `npm login` completed successfully
- **Package name**: Check if name is already taken
- **Permissions**: Verify you have publish permissions
- **Version**: Ensure version number is unique

### **Common GitHub Issues**
- **Repository name**: Check if name is available
- **Remote URL**: Verify correct repository URL
- **Branch name**: Ensure using `main` branch
- **GitHub Actions**: Check workflow file syntax

### **Common Integration Issues**
- **Package links**: Verify repository URLs in package.json
- **Release workflow**: Check GitHub Actions permissions
- **Binary uploads**: Verify file paths in workflow

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Version**: 1.0.0  
**Status**: ✅ Ready for Deployment
