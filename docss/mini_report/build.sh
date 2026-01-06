#!/bin/bash

# Build script for mini_report.tex
# This script provides various options for building the LaTeX document

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to build with pdflatex (3 passes)
build_pdflatex() {
    print_info "Building with pdflatex (3 passes)..."
    
    print_info "Pass 1/3..."
    pdflatex -interaction=nonstopmode mini_report.tex > /dev/null 2>&1 || true
    
    print_info "Pass 2/3..."
    pdflatex -interaction=nonstopmode mini_report.tex > /dev/null 2>&1 || true
    
    print_info "Pass 3/3..."
    pdflatex -interaction=nonstopmode mini_report.tex
    
    print_success "Build completed!"
}

# Function to build with latexmk
build_latexmk() {
    print_info "Building with latexmk..."
    latexmk -pdf -interaction=nonstopmode mini_report.tex
    print_success "Build completed!"
}

# Function to build with bibliography
build_with_bib() {
    print_info "Building with bibliography..."
    
    print_info "Running pdflatex (1st pass)..."
    pdflatex -interaction=nonstopmode mini_report.tex > /dev/null 2>&1 || true
    
    print_info "Running bibtex..."
    bibtex mini_report > /dev/null 2>&1 || true
    
    print_info "Running pdflatex (2nd pass)..."
    pdflatex -interaction=nonstopmode mini_report.tex > /dev/null 2>&1 || true
    
    print_info "Running pdflatex (3rd pass)..."
    pdflatex -interaction=nonstopmode mini_report.tex
    
    print_success "Build with bibliography completed!"
}

# Function to clean auxiliary files
clean() {
    print_info "Cleaning auxiliary files..."
    rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.fdb_latexmk *.fls
    print_success "Cleaned auxiliary files!"
}

# Function to clean all including PDF
clean_all() {
    print_info "Cleaning all generated files..."
    rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg *.fdb_latexmk *.fls *.pdf *.synctex.gz
    print_success "Cleaned all generated files!"
}

# Function to view PDF
view() {
    if [ -f "mini_report.pdf" ]; then
        print_info "Opening PDF..."
        xdg-open mini_report.pdf 2>/dev/null || open mini_report.pdf 2>/dev/null || start mini_report.pdf 2>/dev/null || print_error "Could not open PDF viewer"
    else
        print_error "PDF file not found! Build the document first."
        exit 1
    fi
}

# Function to watch and auto-rebuild
watch() {
    print_info "Starting watch mode (auto-rebuild on changes)..."
    print_warning "Press Ctrl+C to stop"
    latexmk -pdf -pvc -interaction=nonstopmode mini_report.tex
}

# Function to show help
show_help() {
    cat << EOF
${GREEN}Mini Report Build Script${NC}

Usage: ./build.sh [OPTION]

Options:
  ${BLUE}build${NC}         Build the document using pdflatex (default)
  ${BLUE}latexmk${NC}       Build using latexmk (automated)
  ${BLUE}bib${NC}           Build with bibliography support
  ${BLUE}clean${NC}         Remove auxiliary files (keep PDF)
  ${BLUE}clean-all${NC}     Remove all generated files including PDF
  ${BLUE}view${NC}          Open the generated PDF
  ${BLUE}watch${NC}         Watch for changes and auto-rebuild
  ${BLUE}help${NC}          Show this help message

Examples:
  ./build.sh              # Quick build with pdflatex
  ./build.sh latexmk      # Build with latexmk
  ./build.sh bib          # Build with bibliography
  ./build.sh clean        # Clean auxiliary files
  ./build.sh view         # View the PDF

Quick workflow:
  ./build.sh && ./build.sh view    # Build and view
  ./build.sh watch                 # Auto-rebuild on changes

EOF
}

# Main script logic
case "${1:-build}" in
    build)
        build_pdflatex
        ;;
    latexmk)
        build_latexmk
        ;;
    bib|bibliography)
        build_with_bib
        ;;
    clean)
        clean
        ;;
    clean-all|cleanall)
        clean_all
        ;;
    view|open)
        view
        ;;
    watch)
        watch
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
