# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.3] - 2025-10-15
### Added
- **Multi-Provider AI System** - Flexible architecture supporting both OpenAI and LM Studio:
  - `providers/lmstudio.ts` - LM Studio provider for local models (Meta Llama 3, etc.)
  - `providerManager.ts` - Provider switching and configuration management
  - Cloudflare tunneling support for LM Studio deployment
- **Enhanced Authentication System** - Complete user management with Supabase:
  - `lib/auth.ts` - Authentication and trusted contacts management
  - User registration and login functionality
  - Trusted contacts storage and retrieval
- **Supabase Integration** - Database setup for user data and trusted contacts
- **Environment Configuration** - `.env.example` with complete setup instructions for both AI providers

### Enhanced Features
- **Dual AI Provider Support**: Switch between OpenAI GPT-4 and LM Studio local models
- **Cloudflare Integration**: Use LM Studio with Meta Llama 3 over secure tunnels
- **Trusted Contacts Integration**: AI prompts now include family member suggestions for RISKY results
- **Smart Provider Selection**: Auto-detects and prioritizes available AI providers

### Technical Architecture
- **Provider Manager**: Coordinates switching between OpenAI and LM Studio
- **Modular Design**: Easy to add new AI providers (Anthropic, local models, etc.)
- **Cost Optimization**: Use local models for development, OpenAI for production
- **Privacy Enhancement**: Local models keep analysis on your infrastructure

## Project Status
**Current**: Pre-build stable point with complete AI analysis framework ready for frontend integration
**Next**: Implement `/api/analyze` endpoint and user interface for text input

---

*This changelog tracks the development of S Safety Online, an AI-powered email safety checker designed specifically for seniors.*
